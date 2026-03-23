// Card genérica con variantes para la web pública y la intranet
export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`
        bg-white rounded-2xl shadow-card border border-surface-200/60
        ${hover ? 'hover:shadow-card-hover transition-shadow duration-200 cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

// Subcomponentes para mantener estructura consistente sin importar mil archivos
Card.Header = function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-5 py-4 border-b border-surface-200/60 ${className}`}>
      {children}
    </div>
  )
}

Card.Body = function CardBody({ children, className = '' }) {
  return (
    <div className={`px-5 py-4 ${className}`}>
      {children}
    </div>
  )
}

Card.Footer = function CardFooter({ children, className = '' }) {
  return (
    <div className={`px-5 py-4 border-t border-surface-200/60 ${className}`}>
      {children}
    </div>
  )
}
