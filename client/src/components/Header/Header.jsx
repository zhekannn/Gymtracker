import logo from '../../assets/images/logo.jpg'
import classes from './Header.module.css'
export default function Header(){
    return (
        <header>
            <img className={classes.logo} src={logo} alt="" />
            <h2>Gym Tracker</h2>

        </header>
    )
}