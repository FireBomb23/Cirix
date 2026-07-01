import { useState } from 'react';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

const contactCards = [
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--yellow-dark)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    title: 'Morada',
    lines: ['Rua Principal, 123', 'Viseu, Portugal'],
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--yellow-dark)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    title: 'Email',
    lines: ['info@cyrix.pt', 'suporte@cyrix.pt'],
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--yellow-dark)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
    title: 'Telefone',
    lines: ['+351 232 000 000', 'Seg–Sex: 9h–18h'],
  },
];

export default function Contact() {
  const { showToast } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact', form);
      setSent(true);
      showToast('Mensagem enviada com sucesso!', 'success');
      setForm({ name: '', email: '', company: '', phone: '', message: '' });
    } catch {
      showToast('Erro ao enviar mensagem. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>Contacte-nos</h1>
          <p>Estamos disponíveis para responder às suas questões e ajudar a proteger a sua organização.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="contact-cards">
            {contactCards.map((c, i) => (
              <div key={i} className="card text-center">
                <div className="card-content">
                  <div className="contact-icon">{c.icon}</div>
                  <h3 style={{ marginBottom: '0.5rem' }}>{c.title}</h3>
                  {c.lines.map((l, j) => <p key={j} style={{ color: 'var(--slate-600)', fontSize: '0.875rem' }}>{l}</p>)}
                </div>
              </div>
            ))}
          </div>

          <div className="two-col">
            <div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Envie-nos uma mensagem</h2>
              <p style={{ color: 'var(--slate-600)', marginBottom: '2rem' }}>Preencha o formulário e entraremos em contacto em breve.</p>
              {sent && (
                <div className="alert alert-success mb-4">
                  Mensagem enviada com sucesso! Entraremos em contacto brevemente.
                </div>
              )}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-row">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="label">Nome *</label>
                    <input className="input" name="name" value={form.name} onChange={handleChange} placeholder="O seu nome" required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="label">Email *</label>
                    <input className="input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@empresa.pt" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="label">Empresa</label>
                    <input className="input" name="company" value={form.company} onChange={handleChange} placeholder="Nome da empresa" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="label">Telefone</label>
                    <input className="input" name="phone" value={form.phone} onChange={handleChange} placeholder="+351 000 000 000" />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="label">Mensagem *</label>
                  <textarea className="input" name="message" value={form.message} onChange={handleChange} placeholder="Descreva como podemos ajudar..." required />
                </div>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  {loading ? 'A enviar...' : 'Enviar Mensagem'}
                </button>
              </form>
            </div>

            <div>
              <div className="contact-map">
                <div style={{ textAlign: 'center', color: 'var(--slate-500)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} style={{ marginBottom: '0.75rem' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p>Viseu, Portugal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
