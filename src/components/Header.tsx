import { ConnectButton } from "@rainbow-me/rainbowkit";
import "../styles/Header.css"
import logo from "../assets/logo.png";
export default function Header() {
    return (
      <div className="Header">
        <img className="header_logo" src={logo} alt="TRB Logo" />
        <ConnectButton chainStatus="none"/>
      </div>
    );
}