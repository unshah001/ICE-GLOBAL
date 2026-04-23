import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from './ui/button'

const IgenNew = () => {
  return (
     <div className='flex flex-col justify-center items-center mt-32 text-center bg-white-800'>
      
      <h1 className='mb-6 text-2xl font-semibold text-yellow-500'>
        IGEN NEWS  IS COMING SOON ....</h1>
          <img 
          src='https://i.ibb.co/BKnTr8SR/Whats-App-Image-2026-04-22-at-11-22-16-AM.jpg'
          alt='Igen World'
          className='max-w-full h-auto '
        />
        <Link to ="/" className='mt-7'>
   
   <Button className='bg-blue-500'> go to home</Button>
   </Link>
      
    </div>
    
    
    
  )
}

export default IgenNew
