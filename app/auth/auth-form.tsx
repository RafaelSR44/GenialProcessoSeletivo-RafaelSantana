"use client";

import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";
import styles from "./auth.module.css";

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const result = await signIn.email({
          email,
          password,
        });

        if (result.error) {
          setError(result.error.message || "Erro ao fazer login");
        } else {
          setSuccess("Login realizado com sucesso!");
          window.location.href = "/";
        }
      } else {
        // Register
        const result = await signUp.email({
          email,
          password,
          name,
        });

        if (result.error) {
          setError(result.error.message || "Erro ao criar conta");
        } else {
          setSuccess("Conta criada com sucesso! Faça login.");
          setIsLogin(true);
          setPassword("");
        }
      }
    } catch (err) {
      setError("Erro inesperado. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h1 className={styles.title}>
          {isLogin ? "Login" : "Criar Conta"}
        </h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <div className={styles.field}>
              <label htmlFor="name" className={styles.label}>
                Nome
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                required={!isLogin}
                disabled={loading}
              />
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
              disabled={loading}
              minLength={8}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          <button
            type="submit"
            className={styles.button}
            disabled={loading}
          >
            {loading
              ? "Processando..."
              : isLogin
              ? "Entrar"
              : "Criar Conta"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError("");
            setSuccess("");
          }}
          className={styles.toggleButton}
          disabled={loading}
        >
          {isLogin
            ? "Não tem conta? Criar conta"
            : "Já tem conta? Fazer login"}
        </button>
      </div>
    </div>
  );
}
