import { Link } from 'react-router-dom'
import React from 'react'
import { Button } from './ui/button'


const IgenWorld = () => {
  return (
    <div className='flex flex-col justify-center items-center mt-32 text-center bg-white-800'>
      
      <h1 className='mb-6 text-2xl font-semibold text-yellow-500'>
        IGEN WORLD COMING SOON....
      </h1>

      
      <img src='https://i.ibb.co/TDHDZ6n5/Whats-App-Image-2026-04-22-at-11-21-25-AM.jpg' />
    
   <Link to ="/" className='mt-7'>
   
   <Button className='bg-blue-500'> go to home</Button>
   </Link>
    </div>
  )
}

export default IgenWorld