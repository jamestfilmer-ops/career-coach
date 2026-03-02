"use client";
import dynamic from "next/dynamic";

const CareerDiscovery = dynamic(
  () => import("../../components/CareerDiscovery"),
  { ssr: false }
);

export default function Home() {
  return <CareerDiscovery />;
}
