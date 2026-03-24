/**
 * @file ShortenPage.jsx
 * @description File: ShortenPage. Part of the frontend application.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../layout/Footer';
import API, { fetchWithAuth } from "../../utils/api";
import toast from "react-hot-toast";
import './ShortenPage.css';

function ShortenPage() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!longUrl) return;

    setIsLoading(true);

    try {
      const data = await fetchWithAuth("/create-url", {
        method: "POST",
        body: JSON.stringify({
          original_url: longUrl,
        }),
      });

      const newUrl = `http://localhost:5000/api/${data.short_code}`;
      setShortUrl(newUrl);
      setCopied(false);
      setShowModal(true);

      toast.success("Link shortened successfully 🎉");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to shorten URL");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);

    toast.success("Copied to clipboard!");

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="landing-page-wrapper min-h-screen flex flex-col">
      <Header />

      <main className="shorten-main container flex-col items-center flex-1 w-full">
        <div className="shorten-card">

          <h1 className="shorten-title">Shorten Your Link</h1>
          <p className="shorten-subtitle">Fast, secure, and ready to share.</p>

          <form onSubmit={handleShorten} className="shorten-form">
            <input
              type="url"
              placeholder="Paste your long URL here..."
              className="url-input"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              required
            />

            <button
              type="submit"
              className="btn btn-primary shorten-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Shorten'}
            </button>
          </form>

          <div className="auth-prompt">
            <p>Want to track clicks and customize links?</p>
            <div className="auth-actions">
              <Link to="/login" className="btn btn-secondary action-btn">Log in</Link>
              <Link to="/register" className="btn btn-primary action-btn">Register</Link>
            </div>
          </div>

        </div>
      </main>

      {/* 🔥 MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>

            <div className="modal-success">✅</div>

            <h3>Link Successfully Shortened!</h3>

            <div className="modal-url-box">
              <span>{shortUrl}</span>

              <button
                onClick={handleCopy}
                className={`copy-btn ${copied ? 'copied' : ''}`}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default ShortenPage;