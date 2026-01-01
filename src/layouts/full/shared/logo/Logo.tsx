
import { Link } from 'react-router'
import logoImage from 'src/assets/images/logos/logo.jpeg'

const Logo = () => {
    return (
        <Link to={'/'}>
            <img 
                src={logoImage} 
                alt="logo" 
                className="h-10 w-auto object-contain"
            />
        </Link>
    )
}

export default Logo
