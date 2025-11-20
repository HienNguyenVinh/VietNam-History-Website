import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveAuth } from '../../utils/auth';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const validate = () => {
    const errs = {};
    if (!name || name.trim().length < 2) errs.name = 'Tên phải ít nhất 2 ký tự';
    if (!email) errs.email = 'Email là bắt buộc';
    else if (!validateEmail(email)) errs.email = 'Email không hợp lệ';
    if (!password) errs.password = 'Mật khẩu là bắt buộc';
    else if (password.length < 6) errs.password = 'Mật khẩu phải ít nhất 6 ký tự';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      saveAuth(data.token, data.user);
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
    finally { setLoading(false); }
  };

  return (
    <div className="authCard">
      <h2>Đăng ký</h2>
      <form className="authForm" onSubmit={submit} noValidate>
        <div className="authField">
          <label>Họ và tên</label>
          <input value={name} onChange={e => setName(e.target.value)} type="text" />
          {fieldErrors.name && <div className="fieldError">{fieldErrors.name}</div>}
        </div>
        <div className="authField">
          <label>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" />
          {fieldErrors.email && <div className="fieldError">{fieldErrors.email}</div>}
        </div>
        <div className="authField">
          <label>Mật khẩu</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" />
          {fieldErrors.password && <div className="fieldError">{fieldErrors.password}</div>}
        </div>
        <div className="authActions">
          <button className="authButton" type="submit" disabled={loading}>{loading ? 'Đang...' : 'Đăng ký'}</button>
        </div>
        {error && <div className="authError">{error}</div>}
      </form>
    </div>
  );
}
