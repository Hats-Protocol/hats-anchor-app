import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div className=" flex-grow flex justify-center items-center bg-slate-50">
      <h1 className=" text-6xl font-serif">Welcome to hats</h1>
    </div>
  );
}
