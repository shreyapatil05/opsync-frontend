import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-4 mt-auto">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} Opsync. All rights reserved.</p>
        <div className="mt-2 space-x-4">
          <a href="/terms" className="hover:text-gray-300">Terms</a>
          <a href="/privacy" className="hover:text-gray-300">Privacy</a>
          <a href="/contact" className="hover:text-gray-300">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;