import { Component } from "react";
import { Link } from "react-router-dom";
import BrandLogo from "../branding/BrandLogo";

export default class RouteErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error("route_render_failed", error); }
  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="grid min-h-screen place-items-center bg-[#fffaf2] p-6 text-center"><div><BrandLogo variant="symbol" className="mx-auto h-24 w-24"/><h1 className="mt-5 font-display text-4xl text-[#173c34]">Something went wrong.</h1><p className="mt-3 text-slate-600">This page could not be displayed. Your information has not been changed.</p><div className="mt-7 flex justify-center gap-3"><button onClick={() => { this.setState({ failed: false }); window.location.reload(); }} className="btn-primary">Try again</button><Link to="/" className="btn-secondary">Go home</Link></div></div></main>;
  }
}
