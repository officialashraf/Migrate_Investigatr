import React from 'react'
import GoogleMapLocation from '../../Common/Maps/googleMap'

const MapLocation = () => {
    const apiData =        [
  { lat: 22.9736, lng: 76.0522 },   // Paris
  { lat: 22.967, lng: 76.0534 }, // New York
  { lat: 23.1765, lng: 75.7885 }  // Tokyo
]

    
  return (
    <GoogleMapLocation markers={apiData} />
  )
}

export default MapLocation