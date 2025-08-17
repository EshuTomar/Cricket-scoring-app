"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"

interface Match {
  _id: string
  matchId: number
  team1: string
  team2: string
  status: string
  currentScore: {
    runs: number
    wickets: number
    overs: number
    balls: number
  }
  createdAt: string
}

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [team1, setTeam1] = useState("")
  const [team2, setTeam2] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      const response = await fetch("http://localhost:5000/matches")
      const data = await response.json()
      setMatches(data)
    } catch (error) {
      console.error("Error fetching matches:", error)
    } finally {
      setLoading(false)
    }
  }

  const createMatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!team1 || !team2) return

    setCreating(true)
    try {
      const response = await fetch("http://localhost:5000/matches/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ team1, team2 }),
      })

      if (response.ok) {
        setTeam1("")
        setTeam2("")
        fetchMatches()
      }
    } catch (error) {
      console.error("Error creating match:", error)
    } finally {
      setCreating(false)
    }
  }

  const containerStyle = {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "white",
    minHeight: "100vh",
  }

  const headerStyle = {
    textAlign: "center" as const,
    color: "#333",
    marginBottom: "30px",
    borderBottom: "2px solid #007bff",
    paddingBottom: "10px",
  }

  const formStyle = {
    backgroundColor: "#f8f9fa",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "30px",
    border: "1px solid #dee2e6",
  }

  const inputStyle = {
    width: "100%",
    padding: "10px",
    margin: "5px 0",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "16px",
  }

  const buttonStyle = {
    backgroundColor: "#007bff",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    width: "100%",
  }

  const matchCardStyle = {
    border: "1px solid #dee2e6",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "15px",
    backgroundColor: "white",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  }

  const matchHeaderStyle = {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "10px",
  }

  const scoreStyle = {
    fontSize: "16px",
    color: "#666",
    marginBottom: "10px",
  }

  const linkStyle = {
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "bold",
  }

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>Cricket Scoring App</h1>

      <div style={formStyle}>
        <h2 style={{ marginTop: 0, color: "#333" }}>Start New Match</h2>
        <form onSubmit={createMatch}>
          <input
            type="text"
            placeholder="Team 1 Name"
            value={team1}
            onChange={(e) => setTeam1(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="text"
            placeholder="Team 2 Name"
            value={team2}
            onChange={(e) => setTeam2(e.target.value)}
            style={inputStyle}
            required
          />
          <button
            type="submit"
            disabled={creating}
            style={{
              ...buttonStyle,
              backgroundColor: creating ? "#6c757d" : "#007bff",
            }}
          >
            {creating ? "Creating..." : "Start Match"}
          </button>
        </form>
      </div>

      <h2 style={{ color: "#333" }}>Ongoing Matches</h2>

      {loading ? (
        <p style={{ textAlign: "center", color: "#666" }}>Loading matches...</p>
      ) : matches.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666" }}>No matches found. Start a new match!</p>
      ) : (
        matches.map((match) => (
          <div key={match._id} style={matchCardStyle}>
            <div style={matchHeaderStyle}>
              Match #{match.matchId}: {match.team1} vs {match.team2}
            </div>
            <div style={scoreStyle}>
              Score: {match.currentScore.runs}/{match.currentScore.wickets}({match.currentScore.overs}.
              {match.currentScore.balls} overs)
            </div>
            <div style={{ marginTop: "10px" }}>
              <Link href={`/match/${match.matchId}`} style={linkStyle}>
                View Live Commentary →
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
