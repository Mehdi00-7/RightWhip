"use client";

import{useEffect,useState} from "react"

export default function HealthStatus() {
    const [status, setStatus] = useState("Loading...");
    useEffect(() => {
        fetch("http://localhost:8000/health")
            .then((res) => res.json())
            .then((data) => {setStatus(data.status)})
            .catch((err) => {setStatus("Error")});
    }, []);
    return <p>API status : {status}</p>;
}