"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { io, type Socket } from "socket.io-client"
import Link from "next/link"

interface Commentary {
  over: number
  ball: number
  eventType: string
  description: string
  runs: number
  timestamp: string
}

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
  commentary: Commentary[]
}

export default function MatchPage() {
  const params = useParams()
  const matchId = params.id as string

  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState<Socket | null>(null)

  // Commentary form state
  const [over, setOver] = useState("")
  const [ball, setBall] = useState("")
  const [eventType, setEventType] = useState("run")
  const [description, setDescription] = useState("")
  const [runs, setRuns] = useState("0")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchMatch()

    // Initialize socket connection
    const newSocket = io("http://localhost:5000")
    setSocket(newSocket)

    // Join match room
    newSocket.emit("join-match", matchId)

    // Listen for commentary updates
    newSocket.on("commentary-update", (data) => {
      if (data.matchId === Number.parseInt(matchId)) {
        setMatch((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            commentary: [...prev.commentary, data.commentary],
            currentScore: data.currentScore,
          }
        })
      }
    })

    return () => {
      newSocket.disconnect()
    }
  }, [matchId])

  const fetchMatch = async () => {
    try {
      const response = await fetch(`http://localhost:5000/matches/${matchId}`)
      if (response.ok) {
        const data = await response.json()
        setMatch(data)
      }
    } catch (error) {
      console.error("Error fetching match:", error)
    } finally {
      setLoading(false)
    }
  }

  const addCommentary = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!over || !ball || !description) return

    setSubmitting(true)
    try {
      const response = await fetch(`http://localhost:5000/matches/${matchId}/commentary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          over: Number.parseInt(over),
          ball: Number.parseInt(ball),
          eventType,
          description,
          runs: Number.parseInt(runs),
        }),
      })

      if (response.ok) {
        setOver("")
        setBall("")
        setDescription("")
        setRuns("0")
      }
    } catch (error) {
      console.error("Error adding commentary:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const containerStyle = {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "white",
    minHeight: "100vh",
  }

  const headerStyle = {
    textAlign: "center" as const,
    color: "#333",
    marginBottom: "20px",
    borderBottom: "2px solid #007bff",
    paddingBottom: "10px",
  }

  const scoreboardStyle = {
    backgroundColor: "#f8f9fa",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "20px",
    border: "1px solid #dee2e6",
    textAlign: "center" as const,
  }

  const formStyle = {
    backgroundColor: "#f8f9fa",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "20px",
    border: "1px solid #dee2e6",
  }

  const inputStyle = {
    padding: "8px",
    margin: "5px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "14px",
  }

  const selectStyle = {
    ...inputStyle,
    backgroundColor: "white",
  }

  const buttonStyle = {
    backgroundColor: "#007bff",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  }

  const commentaryStyle = {
    border: "1px solid #dee2e6",
    borderRadius: "8px",
    maxHeight: "400px",
    overflowY: "auto" as const,
    backgroundColor: "white",
  }

  const commentaryItemStyle = {
    padding: "10px",
    borderBottom: "1px solid #eee",
    fontSize: "14px",
  }

  if (loading) {
    return (
      <div style={containerStyle}>
        <p style={{ textAlign: "center", color: "#666" }}>Loading match...</p>
      </div>
    )
  }

  if (!match) {
    return (
      <div style={containerStyle}>
        <p style={{ textAlign: "center", color: "#666" }}>Match not found</p>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link href="/" style={{ color: "#007bff", textDecoration: "none" }}>
            ← Back to Matches
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: "20px" }}>
        <Link href="/" style={{ color: "#007bff", textDecoration: "none" }}>
          ← Back to Matches
        </Link>
      </div>

      <h1 style={headerStyle}>
        Match #{match.matchId}: {match.team1} vs {match.team2}
      </h1>

      <div style={scoreboardStyle}>
        <h2 style={{ margin: "0 0 10px 0", color: "#333" }}>Current Score</h2>
        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#007bff" }}>
          {match.currentScore.runs}/{match.currentScore.wickets}
        </div>
        <div style={{ fontSize: "16px", color: "#666", marginTop: "5px" }}>
          Overs: {match.currentScore.overs}.{match.currentScore.balls}
        </div>
      </div>

      <div style={formStyle}>
        <h3 style={{ marginTop: 0, color: "#333" }}>Add Commentary</h3>
        <form onSubmit={addCommentary} style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "end" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#666" }}>Over</label>
            <input
              type="number"
              value={over}
              onChange={(e) => setOver(e.target.value)}
              style={inputStyle}
              min="1"
              required
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#666" }}>Ball</label>
            <input
              type="number"
              value={ball}
              onChange={(e) => setBall(e.target.value)}
              style={inputStyle}
              min="1"
              max="6"
              required
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#666" }}>Event</label>
            <select value={eventType} onChange={(e) => setEventType(e.target.value)} style={selectStyle}>
              <option value="run">Run</option>
              <option value="wicket">Wicket</option>
              <option value="wide">Wide</option>
              <option value="no-ball">No Ball</option>
              <option value="boundary">Boundary</option>
              <option value="six">Six</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#666" }}>Runs</label>
            <input type="number" value={runs} onChange={(e) => setRuns(e.target.value)} style={inputStyle} min="0" />
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "#666" }}>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ ...inputStyle, width: "100%" }}
              placeholder="Ball description..."
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{
              ...buttonStyle,
              backgroundColor: submitting ? "#6c757d" : "#007bff",
            }}
          >
            {submitting ? "Adding..." : "Add"}
          </button>
        </form>
      </div>

      <div>
        <h3 style={{ color: "#333" }}>Live Commentary</h3>
        <div style={commentaryStyle}>
          {match.commentary.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
              No commentary yet. Add the first ball!
            </div>
          ) : (
            [...match.commentary].reverse().map((comment, index) => (
              <div key={index} style={commentaryItemStyle}>
                <strong style={{ color: "#007bff" }}>
                  {comment.over}.{comment.ball}
                </strong>
                <span
                  style={{
                    backgroundColor:
                      comment.eventType === "wicket"
                        ? "#dc3545"
                        : comment.eventType === "boundary" || comment.eventType === "six"
                          ? "#28a745"
                          : "#6c757d",
                    color: "white",
                    padding: "2px 6px",
                    borderRadius: "3px",
                    fontSize: "12px",
                    marginLeft: "10px",
                    marginRight: "10px",
                  }}
                >
                  {comment.eventType.toUpperCase()}
                </span>
                {comment.runs > 0 && <span style={{ fontWeight: "bold", color: "#28a745" }}>+{comment.runs} runs</span>}
                <div style={{ marginTop: "5px", color: "#333" }}>{comment.description}</div>
                <div style={{ fontSize: "12px", color: "#999", marginTop: "5px" }}>
                  {new Date(comment.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
