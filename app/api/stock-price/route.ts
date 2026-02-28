import { NextRequest, NextResponse } from "next/server"

/**
 * Yahoo Finance requires a two-step crumb/cookie handshake since 2024.
 * This module caches the session so we don't re-authenticate on every request.
 */

interface YahooSession {
    crumb: string
    cookie: string
    fetchedAt: number
}

// Cache the Yahoo session for 30 minutes (in-memory, per server instance)
let yahooSession: YahooSession | null = null

async function getYahooSession(): Promise<YahooSession | null> {
    const now = Date.now()

    // Return cached session if still fresh (< 30 minutes)
    if (yahooSession && now - yahooSession.fetchedAt < 30 * 60 * 1000) {
        return yahooSession
    }

    try {
        // Step 1: Hit Yahoo Finance to get a session cookie
        const consentRes = await fetch("https://fc.yahoo.com", {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                Accept: "text/html,application/xhtml+xml",
            },
            redirect: "follow",
        })

        const rawCookie = consentRes.headers.get("set-cookie") ?? ""
        // Extract relevant cookie parts (A1, A3, etc.)
        const cookie = rawCookie
            .split(",")
            .map((c) => c.split(";")[0].trim())
            .filter(Boolean)
            .join("; ")

        // Step 2: Get the crumb using the cookie
        const crumbRes = await fetch(
            "https://query2.finance.yahoo.com/v1/test/getcrumb",
            {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    Accept: "*/*",
                    Cookie: cookie,
                },
            }
        )

        if (!crumbRes.ok) throw new Error(`Crumb fetch failed: ${crumbRes.status}`)

        const crumb = await crumbRes.text()
        if (!crumb || crumb.includes("<")) throw new Error("Invalid crumb received")

        yahooSession = { crumb, cookie, fetchedAt: now }
        return yahooSession
    } catch (err) {
        console.error("Failed to establish Yahoo Finance session:", err)
        return null
    }
}

/**
 * GET /api/stock-price?symbols=AAPL,NVDA,THB%3DX
 *
 * Returns: { "AAPL": 175.50, "NVDA": 138.80, "THB=X": 35.12, ... }
 * null value means the symbol was not found.
 */
export async function GET(req: NextRequest) {
    const symbolsParam = req.nextUrl.searchParams.get("symbols")
    if (!symbolsParam) {
        return NextResponse.json(
            { error: "symbols parameter is required" },
            { status: 400 }
        )
    }

    const symbolList = symbolsParam
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)

    if (symbolList.length === 0) {
        return NextResponse.json(
            { error: "No valid symbols provided" },
            { status: 400 }
        )
    }

    const results: Record<string, number | null> = {}

    try {
        const session = await getYahooSession()

        const headers: Record<string, string> = {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "application/json",
        }
        if (session) {
            headers["Cookie"] = session.cookie
        }

        const crumbParam = session ? `&crumb=${encodeURIComponent(session.crumb)}` : ""
        const url = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(
            symbolList.join(",")
        )}&fields=regularMarketPrice,symbol${crumbParam}`

        const res = await fetch(url, { headers })

        if (!res.ok) {
            // Invalidate the cached session so next request will re-authenticate
            yahooSession = null
            throw new Error(`Yahoo Finance responded with status ${res.status}`)
        }

        const data = await res.json()
        const quoteResults: any[] = data?.quoteResponse?.result ?? []

        for (const quote of quoteResults) {
            const sym = String(quote.symbol).toUpperCase()
            const price = quote.regularMarketPrice as number | undefined
            results[sym] = price ?? null
        }

        // Mark any symbol that didn't come back as null
        for (const sym of symbolList) {
            if (!(sym in results)) {
                results[sym] = null
            }
        }
    } catch (err) {
        console.error("Yahoo Finance fetch error:", err)
        return NextResponse.json(
            { error: "Failed to fetch from Yahoo Finance" },
            { status: 502 }
        )
    }

    return NextResponse.json(results, {
        headers: {
            // Cache in browser for 30 seconds, revalidate on next request
            "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
        },
    })
}
