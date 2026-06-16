import React from 'react'

function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`
        card
        ${hover ? 'cursor-pointer hover:scale-[1.02]' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card