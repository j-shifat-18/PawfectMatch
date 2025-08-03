import React from "react";
import PawfectMatchLogo from "../PawfectMatchLogo/PawfectMatchLogo";

const Footer = () => {
  return (
    <footer className="footer sm:footer-horizontal bg-orange-200 text-base-content p-10 mt-24">
      <aside>
        <PawfectMatchLogo />
        <p>
          PawfectMatch — Where hearts find paws. <br />
          Connecting pets with loving homes since 2024.
        </p>
      </aside>

      <nav>
        <h6 className="footer-title">Explore</h6>
        <a className="link link-hover">Adopt a Pet</a>
        <a className="link link-hover">Post for Adoption</a>
        <a className="link link-hover">Pet Care Tips</a>
        <a className="link link-hover">Success Stories</a>
      </nav>

      <nav>
        <h6 className="footer-title">Resources</h6>
        <a className="link link-hover">FAQs</a>
        <a className="link link-hover">Terms of Service</a>
        <a className="link link-hover">Privacy Policy</a>
        <a className="link link-hover">Cookie Policy</a>
      </nav>

      <nav>
        <h6 className="footer-title">Contact Us</h6>
        <p className="link link-hover">📧 info.jahirulsifat@gmail.com</p>
        <p className="link link-hover">📞 +880 1612872845</p>
        <p className="link link-hover">📍 Dhaka, Bangladesh</p>
      </nav>
    </footer>
  );
};

export default Footer;
