import Logo from '../assets/Logo.png'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  const handleAddWorkflow = () => {
    navigate('/add')
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="navbar bg-base-100 border-b border-base-300">
        <div className="navbar-center">
          <img src={Logo} alt="App logo" className="w-60 h-auto" />
        </div>
      </div>
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-primary mb-4">Welcome to Your Workflow Manager</h1>
          <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
            Make your workflows, save them or open a previous workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 border border-primary/20">
            <div className="card-body text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
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
              </div>
              <div className="card-actions justify-center">
                <button className="btn btn-primary btn-lg px-8" onClick={handleAddWorkflow}>
                  Add Workflow
                </button>
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 border border-secondary/20">
            <div className="card-body text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 1v4"
                    />
                  </svg>
                </div>
                <h2 className="card-title text-2xl justify-center text-secondary">
                  Open Previous Workflow
                </h2>
                <p className="text-base-content/60 mt-2">
                  Continue working on your saved workflows and projects
                </p>
              </div>
              <div className="card-actions justify-center">
                <button className="btn btn-secondary btn-lg px-8">Browse Workflows</button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="divider">
            <span className="text-base-content/40">Recent Activity</span>
          </div>
          <p className="text-base-content/50 mt-4">Your recent workflows will appear here</p>
        </div>
      </div>
    </div>
  )
}
