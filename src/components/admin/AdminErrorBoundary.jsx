import { Component } from "react";
import BrandLogo from "../branding/BrandLogo";

export default class AdminErrorBoundary extends Component {
  state={error:null};
  static getDerivedStateFromError(error){return {error}}
  componentDidCatch(error,details){console.error("admin_interface_failed",error,details)}
  retry=()=>{window.location.reload()};
  signOut=()=>{sessionStorage.removeItem("naystrip_admin_session");window.location.assign("/admin/login")};
  render(){
    if(!this.state.error)return this.props.children;
    return <main className="grid min-h-screen place-items-center bg-navy-50 p-5"><section role="alert" className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg"><BrandLogo className="mx-auto h-24 w-auto"/><h1 className="mt-5 font-display text-3xl text-navy-900">The admin page could not load</h1><p className="mt-3 text-sm text-navy-500">Your data has not been changed. Retry the page, or sign in again if your session expired.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><button onClick={this.retry} className="btn-primary">Retry page</button><button onClick={this.signOut} className="btn-secondary">Sign in again</button></div></section></main>;
  }
}
