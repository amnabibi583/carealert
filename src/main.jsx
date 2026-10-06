import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const STORAGE_KEY = 'carealert-emergency-contacts';
const emptyForm = { name: '', relationship: '', phone: '', priority: '' };
const phoneError = 'Phone number must be 11 digits, like 03001234567.';

function App() {
  const [form, setForm] = useState(emptyForm);
  const [contacts, setContacts] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts)); }, [contacts]);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setMessage('');
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Contact name is required.';
    if (!form.relationship.trim()) next.relationship = 'Relationship is required.';
    if (!/^\d{11}$/.test(form.phone)) next.phone = phoneError;
    if (!form.priority) next.priority = 'Priority is required.';
    return next;
  };

  const save = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setSaving(true); setMessage('');
    await new Promise((resolve) => setTimeout(resolve, 350));
    setContacts((current) => [...current, { ...form, id: crypto.randomUUID() }]);
    setForm(emptyForm); setErrors({}); setMessage('Emergency contact saved successfully.'); setSaving(false);
  };

  const remove = (id) => {
    if (window.confirm('Delete this emergency contact?')) {
      setContacts((current) => current.filter((contact) => contact.id !== id));
      setMessage('Emergency contact deleted.');
    }
  };

  return <main className="app-shell">
    <header><div className="brand-mark" aria-hidden="true">+</div><div><p className="eyebrow">CareAlert</p><h1>Emergency Contact Manager</h1></div></header>
    <section className="intro"><p>Keep the people you trust close when it matters most.</p></section>
    <div className="layout">
      <section className="panel" aria-labelledby="add-heading">
        <h2 id="add-heading">Add a contact</h2>
        <form onSubmit={save} noValidate>
          <Field label="Contact name" name="name" value={form.name} onChange={update} error={errors.name} />
          <Field label="Relationship" name="relationship" value={form.relationship} onChange={update} error={errors.relationship} />
          <Field label="Phone number" name="phone" value={form.phone} onChange={update} error={errors.phone} inputMode="numeric" />
          <div className="field"><label htmlFor="priority">Priority</label><select id="priority" name="priority" value={form.priority} onChange={update} aria-invalid={Boolean(errors.priority)} aria-describedby={errors.priority ? 'priority-error' : undefined}><option value="">Select a priority</option><option>Primary</option><option>Secondary</option><option>Emergency</option></select>{errors.priority && <span className="error" id="priority-error" role="alert">{errors.priority}</span>}</div>
          <button className="save-button" disabled={saving}>{saving ? 'Saving…' : 'Save Contact'}</button>
          {message && <p className="message" role="status">{message}</p>}
        </form>
      </section>
      <section className="contacts" aria-labelledby="contacts-heading"><div className="section-heading"><h2 id="contacts-heading">Your contacts</h2><span className="count">{contacts.length}</span></div>{contacts.length === 0 ? <div className="empty"><div className="empty-icon" aria-hidden="true">♡</div><h3>No contacts yet</h3><p>Add an emergency contact to see them here.</p></div> : <div className="contact-list">{contacts.map((contact) => <article className="contact-card" key={contact.id}><div className="contact-top"><div><h3>{contact.name}</h3><p>{contact.relationship}</p></div><span className={`badge ${contact.priority.toLowerCase()}`}>{contact.priority}</span></div><p className="phone">☎ <span>{contact.phone}</span></p><button className="delete-button" onClick={() => remove(contact.id)}>Delete</button></article>)}</div>}</section>
    </div>
  </main>;
}

function Field({ label, name, value, onChange, error, inputMode }) { return <div className="field"><label htmlFor={name}>{label}</label><input id={name} name={name} value={value} onChange={onChange} inputMode={inputMode} aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : undefined} />{error && <span className="error" id={`${name}-error`} role="alert">{error}</span>}</div>; }

createRoot(document.getElementById('root')).render(<App />);
