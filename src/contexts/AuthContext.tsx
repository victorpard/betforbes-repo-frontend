const login = async (email: string, password: string) => {
  console.groupCollapsed('[AuthContext] login request')
  console.log('→ URL:', `/api/auth/login`)
  console.log('→ Payload:', { email, password })

  setIsLoading(true)
  try {
    const res = await fetch(`/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })

    console.log('← Status:', res.status, res.statusText)

    // tenta ler como JSON primeiro
    let text = await res.text()
    try {
      const body = JSON.parse(text)
      console.log('← JSON:', body)
      if (!res.ok || body.success === false) {
        console.groupEnd()
        setIsLoading(false)
        return { success: false, error: body.message || 'Credenciais inválidas' }
      }

      // tudo OK
      const token = body.data.tokens.accessToken
      const u: User = body.data.user
      console.log('← Access Token:', token)
      console.groupEnd()

      localStorage.setItem('authToken', token)
      setUser(u)
      setIsAuthenticated(true)
      setIsLoading(false)
      return { success: true }

    } catch (jsonErr) {
      // não era JSON válido, imprima como texto bruto
      console.warn('[AuthContext] resposta não é JSON válido:')
      console.log(text)
      console.groupEnd()
      setIsLoading(false)
      return { success: false, error: `Resposta inválida do servidor` }
    }

  } catch (err: any) {
    console.error('[AuthContext] login network error:', err)
    console.groupEnd()
    setIsLoading(false)
    return { success: false, error: err.message || 'Erro de rede' }
  }
}
