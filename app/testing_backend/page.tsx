"use client";

import { useEffect, useState } from 'react'

export default function Home() {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/texts/random')
            .then(res => res.json())
            .then(data => {
                setMessage(data.text_content);
                setLoading(false);
            })
    }, [])

    return (
        <div>
            <h1 className='font-bold'>Fetching a Random Text from database</h1>
            <div className='text-center'>
            <p className='m-3'> {!loading ? message : "Loading.."}</p>
            </div>
        </div>
    )
}