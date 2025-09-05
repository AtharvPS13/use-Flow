import Workspace from '../components/Workspace'
import Logo from '../assets/Logo.png'

export default function Add() {
  return (
    <>
      <div className="navbar bg-base-100 border-b border-base-300">
        <div className="navbar-center">
          <img src={Logo} alt="App logo" className="w-60 h-auto" />
        </div>
      </div>
      <Workspace />
    </>
  )
}
