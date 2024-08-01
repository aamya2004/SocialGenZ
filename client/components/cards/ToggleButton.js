import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import styles from './ToggleButton.module.css';
import { IoMoon, IoSunny } from 'react-icons/io5';

const ToggleButton = ({ toggleTheme, theme }) => {
  return (
    <div className={styles.toggleContainer}>
      <input 
        type="checkbox" 
        id="toggle" 
        className={styles.toggleCheckbox} 
        checked={theme === "dark"} 
        onChange={toggleTheme}
      />
      <label htmlFor="toggle" className={styles.toggleLabel}>
        <span className={styles.toggleInner} />
        <span className={styles.toggleSwitch} />
      </label>
        {
            theme==="dark" ? <IoMoon/> : <IoSunny/>
        }
    </div>
  );
};

export default ToggleButton;
