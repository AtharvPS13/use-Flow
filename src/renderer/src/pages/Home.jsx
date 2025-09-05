import Logo from '../assets/Logo.png'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const [workflows, setWorkflows] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    window.electronAPI.loadWorkspaces().then((ws) => {
      if (ws) setWorkflows(ws)
    })
  }, [])

  const handleAddWorkflow = () => {
    navigate('/add')
  }

  const handleOpenWorkflow = () => {
    if (workflows.length === 0) {
      alert('No workflows found!')
      return
    }
    const topWorkflow = workflows[0]
    window.electronAPI.startWorkspace(topWorkflow)
  }

  return (
    <div className="min-h-screen bg-base-100 flex flex-col items-center max-w-screen">
      <div className="navbar bg-base-100 border-b border-base-300 justify-center">
        <img src={Logo} alt="App logo" className="w-52 h-auto" />
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 pt-20 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-primary mb-4">Welcome to Your Workflow Manager</h1>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Make your workflows, save them, or open a previous workflow
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Create Workflow */}
          <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 border border-primary/20">
            <div className="card-body text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h2 className="card-title text-2xl justify-center text-primary">
                Create New Workflow
              </h2>
              <p className="text-base-content/60 mt-2">
                Build a new workflow from scratch with our intuitive tools
              </p>
              <div className="card-actions justify-center mt-6">
                <button className="btn btn-primary btn-lg px-8" onClick={handleAddWorkflow}>
                  Add Workflow
                </button>
              </div>
            </div>
          </div>

          {/* Open Workflow */}
          <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 border border-secondary/20">
            <div className="card-body text-center">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 1v4" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 1v4" />
                </svg>
              </div>
              <h2 className="card-title text-2xl justify-center text-secondary">
                Open Previous Workflow
              </h2>
              <p className="text-base-content/60 mt-2">
                Continue working on your saved workflows and projects
              </p>
              <div className="card-actions justify-center mt-6">
                <button className="btn btn-secondary btn-lg px-8" onClick={handleOpenWorkflow}>
                  Previous Workflow
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-20 text-center">
          <div className="divider">
            <span className="text-base-content/40">Recent Activity</span>
          </div>
          <p className="text-base-content/50 mt-4">Your recent workflows will appear here</p>
        </div>
      </main>
    </div>
  )
}
