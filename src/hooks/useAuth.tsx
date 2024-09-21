import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export default function useUsuario() {
  const context = useContext(AuthContext)
  if(!context) {
    throw new Error('useUsuario must be used sithing a BudgetProvider')
  }
  return context
}