import { useEffect, useState } from "react"

function getWindowDimension() {
    const { innerWidth: width, innerHeight: height } = window
    return {
        width,
        height
    } 
}

export default function useWindowDimension() {
    const [windowDimensions, setWindowDimentsions] = useState(getWindowDimension)
    
    useEffect(() => {
        function handleResize() {
            setWindowDimentsions(getWindowDimension())
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return windowDimensions
}