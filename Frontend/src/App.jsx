import { useEffect, useMemo, useState } from "react"
import "./App.css"
import heroImage from "./assets/hero.png"

const API_BASE = " https://outfit-planner-1.onrender.com"

const authTabs = [
  { id: "login", label: "Sign In" },
  { id: "register", label: "Create Account" },
]

const occasions = ["Casual", "Formal", "Party"]

const styleNotes = {
  Slim: {
    focus: "Add structure with layered pieces and texture-rich fabrics.",
    palette: "Stone, navy, forest green, and warm neutrals sharpen the silhouette.",
  },
  Average: {
    focus: "Balanced cuts and clean lines work best for everyday versatility.",
    palette: "Olive, charcoal, denim blue, and soft beige are easy wins.",
  },
  Athletic: {
    focus: "Tapered fits highlight shoulders while keeping the waistline clean.",
    palette: "Black, rust, slate, and crisp white build a confident contrast.",
  },
  "Plus-Size": {
    focus: "Choose breathable fabrics, longer lines, and refined structure for comfort.",
    palette: "Ink blue, burgundy, camel, and deep green bring polished depth.",
  },
}

function getFallbackSources(outfit) {
  const occasionImageMap = {
    Casual: `${API_BASE}/uploads/denim.jpg`,
    Formal: heroImage,
    Party: `${API_BASE}/uploads/party-jacket.jpg`,
  }

  const sources = [
    outfit.image ? `${API_BASE}/uploads/${outfit.image}` : "",
    occasionImageMap[outfit.occasion] || heroImage,
    heroImage,
  ]

  return [...new Set(sources.filter(Boolean))]
}

function handleImageFallback(event) {
  const imageElement = event.currentTarget
  const sources = JSON.parse(imageElement.dataset.sources || "[]")
  const nextIndex = Number(imageElement.dataset.index || "0") + 1

  if (nextIndex < sources.length) {
    imageElement.dataset.index = String(nextIndex)
    imageElement.src = sources[nextIndex]
    return
  }

  imageElement.style.display = "none"
}

function App() {
  const [activeAuthTab, setActiveAuthTab] = useState("login")
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [plannerForm, setPlannerForm] = useState({
    height: "172",
    weight: "68",
    chest: "96",
    waist: "82",
    occasion: "Casual",
  })
  const [allOutfits, setAllOutfits] = useState([])
  const [recommendedOutfits, setRecommendedOutfits] = useState([])
  const [authLoading, setAuthLoading] = useState(false)
  const [plannerLoading, setPlannerLoading] = useState(false)
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [authMessage, setAuthMessage] = useState("")
  const [plannerMessage, setPlannerMessage] = useState("")
  const [token, setToken] = useState(() => localStorage.getItem("smart-outfit-token") || "")
  const [userName, setUserName] = useState(() => localStorage.getItem("smart-outfit-user") || "")

  useEffect(() => {
    let ignore = false

    async function loadOutfits() {
      try {
        const response = await fetch(`${API_BASE}/api/outfits`)
        if (!response.ok) {
          throw new Error("Unable to load outfit catalog")
        }

        const data = await response.json()
        if (!ignore) {
          setAllOutfits(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        if (!ignore) {
          setPlannerMessage("Planner is ready, but the outfit catalog could not be loaded from the server.")
        }
      } finally {
        if (!ignore) {
          setCatalogLoading(false)
        }
      }
    }

    loadOutfits()

    return () => {
      ignore = true
    }
  }, [])

  const bodyType = useMemo(() => {
    const height = Number(plannerForm.height)
    const weight = Number(plannerForm.weight)

    if (!height || !weight) {
      return "Average"
    }

    const bmi = weight / ((height / 100) * (height / 100))

    if (bmi < 18.5) return "Slim"
    if (bmi < 25) return "Average"
    if (bmi < 30) return "Athletic"
    return "Plus-Size"
  }, [plannerForm.height, plannerForm.weight])

  const bodyInsight = useMemo(() => {
    const chest = Number(plannerForm.chest)
    const waist = Number(plannerForm.waist)
    const difference = chest - waist

    if (!chest || !waist) {
      return "Balanced frame"
    }

    if (difference >= 14) {
      return "Defined V-shape"
    }

    if (difference >= 6) {
      return "Structured proportions"
    }

    return "Relaxed straight profile"
  }, [plannerForm.chest, plannerForm.waist])

  const bmiLabel = useMemo(() => {
    const height = Number(plannerForm.height)
    const weight = Number(plannerForm.weight)

    if (!height || !weight) {
      return "0.0"
    }

    const bmi = weight / ((height / 100) * (height / 100))
    return bmi.toFixed(1)
  }, [plannerForm.height, plannerForm.weight])

  const personalizedSummary = styleNotes[bodyType]

  async function handleAuthSubmit(event) {
    event.preventDefault()
    setAuthLoading(true)
    setAuthMessage("")

    const endpoint = activeAuthTab === "login" ? "login" : "register"

    try {
      const response = await fetch(`${API_BASE}/api/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(authForm),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed")
      }

      if (activeAuthTab === "register") {
        setAuthMessage("Account created. You can sign in now and start planning outfits.")
        setActiveAuthTab("login")
        setAuthForm((current) => ({
          ...current,
          password: "",
        }))
        return
      }

      const resolvedName = data.user?.name || authForm.name || authForm.email.split("@")[0]

      localStorage.setItem("smart-outfit-token", data.token)
      localStorage.setItem("smart-outfit-user", resolvedName)
      setToken(data.token)
      setUserName(resolvedName)
      setAuthMessage("Welcome back. Your planner is ready.")
    } catch (error) {
      setAuthMessage(error.message)
    } finally {
      setAuthLoading(false)
    }
  }

  async function handlePlannerSubmit(event) {
    event.preventDefault()
    setPlannerLoading(true)
    setPlannerMessage("")

    try {
      const response = await fetch(
        `${API_BASE}/api/outfits/recommend?bodyType=${encodeURIComponent(bodyType)}&occasion=${encodeURIComponent(plannerForm.occasion)}`
      )

      if (!response.ok) {
        throw new Error("Recommendation service is unavailable")
      }

      const data = await response.json()
      const items = Array.isArray(data) ? data : []

      if (items.length > 0) {
        setRecommendedOutfits(items)
        setPlannerMessage(`Showing ${items.length} looks tailored for ${bodyType.toLowerCase()} styling.`)
        return
      }

      const fallback = allOutfits.filter((item) => item.occasion === plannerForm.occasion)
      setRecommendedOutfits(fallback)
      setPlannerMessage("No exact body-type match was returned, so here are the closest occasion-based looks.")
    } catch (error) {
      const fallback = allOutfits.filter((item) => item.occasion === plannerForm.occasion)
      setRecommendedOutfits(fallback)
      setPlannerMessage(
        fallback.length > 0
          ? "The live recommendation endpoint was unavailable, so nearby catalog picks are shown instead."
          : "No recommendations are available right now."
      )
    } finally {
      setPlannerLoading(false)
    }
  }

  function updateAuthField(event) {
    const { name, value } = event.target
    setAuthForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function updatePlannerField(event) {
    const { name, value } = event.target
    setPlannerForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function logout() {
    localStorage.removeItem("smart-outfit-token")
    localStorage.removeItem("smart-outfit-user")
    setToken("")
    setUserName("")
    setAuthMessage("Signed out successfully.")
  }

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Smart Outfit Planner</span>
          <h1>Dress with less doubt and a lot more confidence.</h1>
          <p className="hero-text">
            Get instant outfit suggestions shaped around your measurements, body profile,
            and the moment you are dressing for, from office hours to last-minute party plans.
          </p>

          <div className="hero-grid">
            <article>
              <strong>Measurement-led</strong>
              <p>Height, weight, chest, and waist inputs turn vague style choices into a clearer fit direction.</p>
            </article>
            <article>
              <strong>Occasion aware</strong>
              <p>Switch between casual, formal, and party looks without rebuilding the whole plan.</p>
            </article>
            <article>
              <strong>Auth ready</strong>
              <p>Clean sign in and registration flows make the experience feel like a real product, not a demo.</p>
            </article>
          </div>

          <div className="style-preview">
            <div className="preview-card primary">
              <span>{bodyType}</span>
              <strong>{bodyInsight}</strong>
            </div>
            <div className="preview-card">
              <span>BMI</span>
              <strong>{bmiLabel}</strong>
            </div>
            <div className="preview-card">
              <span>Occasion</span>
              <strong>{plannerForm.occasion}</strong>
            </div>
          </div>
        </div>

        <div className="auth-panel">
          <div className="auth-header">
            <div>
              <p className="auth-kicker">Account Access</p>
              <h2>{token ? `Welcome, ${userName}` : "Login & Registration"}</h2>
            </div>
            {token ? (
              <button className="ghost-button" onClick={logout} type="button">
                Sign Out
              </button>
            ) : null}
          </div>

          {!token ? (
            <>
              <div className="auth-tabs" role="tablist" aria-label="Authentication forms">
                {authTabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={tab.id === activeAuthTab ? "tab-button active" : "tab-button"}
                    onClick={() => {
                      setActiveAuthTab(tab.id)
                      setAuthMessage("")
                    }}
                    type="button"
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <form className="auth-form" onSubmit={handleAuthSubmit}>
                {activeAuthTab === "register" ? (
                  <label>
                    Full Name
                    <input
                      name="name"
                      onChange={updateAuthField}
                      placeholder="Aarav Sharma"
                      required
                      value={authForm.name}
                    />
                  </label>
                ) : null}

                <label>
                  Email Address
                  <input
                    name="email"
                    onChange={updateAuthField}
                    placeholder="you@example.com"
                    required
                    type="email"
                    value={authForm.email}
                  />
                </label>

                <label>
                  Password
                  <input
                    name="password"
                    onChange={updateAuthField}
                    placeholder="Enter a secure password"
                    required
                    type="password"
                    value={authForm.password}
                  />
                </label>

                <button className="primary-button" disabled={authLoading} type="submit">
                  {authLoading
                    ? "Please wait..."
                    : activeAuthTab === "login"
                      ? "Sign In to Planner"
                      : "Create Account"}
                </button>
              </form>
            </>
          ) : (
            <div className="auth-success">
              <p>Your session is active, so you can move straight into planning outfits.</p>
              <div className="success-pills">
                <span>Secure session</span>
                <span>Personalized planner</span>
                <span>Instant recommendations</span>
              </div>
            </div>
          )}

          {authMessage ? <p className="status-text">{authMessage}</p> : null}
        </div>
      </section>

      <section className="planner-panel">
        <div className="planner-header">
          <div>
            <span className="eyebrow">Planner Dashboard</span>
            <h2>Build your outfit recommendation</h2>
          </div>
          <p>
            Enter your measurements, pick the occasion, and let the planner translate that into
            wearable combinations.
          </p>
        </div>

        <div className="planner-layout">
          <form className="planner-form" onSubmit={handlePlannerSubmit}>
            <div className="form-grid">
              <label>
                Height (cm)
                <input
                  min="120"
                  name="height"
                  onChange={updatePlannerField}
                  required
                  type="number"
                  value={plannerForm.height}
                />
              </label>

              <label>
                Weight (kg)
                <input
                  min="30"
                  name="weight"
                  onChange={updatePlannerField}
                  required
                  type="number"
                  value={plannerForm.weight}
                />
              </label>

              <label>
                Chest (cm)
                <input
                  min="60"
                  name="chest"
                  onChange={updatePlannerField}
                  required
                  type="number"
                  value={plannerForm.chest}
                />
              </label>

              <label>
                Waist (cm)
                <input
                  min="50"
                  name="waist"
                  onChange={updatePlannerField}
                  required
                  type="number"
                  value={plannerForm.waist}
                />
              </label>
            </div>

            <label>
              Occasion
              <select name="occasion" onChange={updatePlannerField} value={plannerForm.occasion}>
                {occasions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <button className="primary-button" disabled={plannerLoading || catalogLoading} type="submit">
              {plannerLoading ? "Finding your looks..." : "Get Personalized Outfits"}
            </button>
          </form>

          <aside className="insight-panel">
            <div className="insight-card">
              <span>Recommended profile</span>
              <h3>{bodyType}</h3>
              <p>{personalizedSummary.focus}</p>
            </div>
            <div className="insight-card muted">
              <span>Color direction</span>
              <p>{personalizedSummary.palette}</p>
            </div>
          </aside>
        </div>

        {plannerMessage ? <p className="status-text planner-status">{plannerMessage}</p> : null}

        <div className="results-header">
          <h3>Recommended Outfits</h3>
          <span>{recommendedOutfits.length} looks</span>
        </div>

        <div className="results-grid">
          {catalogLoading ? (
            <article className="empty-card">
              <h4>Loading catalog</h4>
              <p>Connecting to the backend and preparing the planner results.</p>
            </article>
          ) : recommendedOutfits.length > 0 ? (
            recommendedOutfits.map((outfit, index) => {
              const imageSources = getFallbackSources(outfit)

              return (
                <article className="outfit-card" key={outfit._id || `${outfit.top}-${index}`}>
                  <div className="outfit-media">
                    <img
                      alt={`${outfit.top} outfit`}
                      data-index="0"
                      data-sources={JSON.stringify(imageSources)}
                      onError={handleImageFallback}
                      src={imageSources[0]}
                    />
                    <div className="media-overlay">
                      <span>{outfit.occasion || plannerForm.occasion}</span>
                      <strong>{outfit.bodyType || bodyType}</strong>
                    </div>
                  </div>

                  <div className="outfit-content">
                    <h4>{outfit.top}</h4>
                    <p>{outfit.description || "A coordinated look designed to stay polished without overthinking."}</p>
                    <ul>
                      <li>Top: {outfit.top}</li>
                      <li>Bottom: {outfit.bottom}</li>
                      <li>Footwear: {outfit.footwear}</li>
                    </ul>
                  </div>
                </article>
              )
            })
          ) : (
            <article className="empty-card">
              <h4>No looks yet</h4>
              <p>Fill in your measurements and choose an occasion to generate outfit suggestions.</p>
            </article>
          )}
        </div>
      </section>
    </main>
  )
}

export default App
