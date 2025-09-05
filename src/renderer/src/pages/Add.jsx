import { useNavigate } from 'react-router-dom'

export default function Add() {
  const navigate = useNavigate()
  const handleClick = () => {
    navigate('/')
  }
  return (
    <div>
      <p>Hello this is the add page</p>
      <div className="btn" onClick={handleClick}>
        <p>Go to home</p>
      </div>
    </div>
  )
}
