import { useState } from "react";
import { EnterIcon, PersonIcon, CaretDownIcon, HeartFilledIcon, EyeOpenIcon, ExitIcon } from "@radix-ui/react-icons";
import * as Toast from "@radix-ui/react-toast";
import { NavigationMenu } from "radix-ui";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/filmhub_logo.png";
import type { RootState } from "../../store";
import { signOut } from "../../utils/authUtils";
import styles from "./Header.module.scss";

function Header() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const username = user?.email?.split("@")[0] ?? "Account";
  const [toastOpen, setToastOpen] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const keyword = query.trim();
    if (keyword.length > 0) {
      navigate(`/search?query=${encodeURIComponent(keyword)}&page=1`);
    } else {
      navigate("/search");
    }
  };

  const handleLogout = async () => {
    await signOut();
    setToastOpen(true);
    navigate("/");
  };

  return (
    <div className="container">
      <header className={styles.header}>
        <Link className={styles.title} to="/">
          <img src={logo} alt="FilmHub Logo" className={styles.logo} />
        </Link>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input className={styles.input} type="text" placeholder="Enter keywords..." value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search movies" />
        </form>
        {isAuthenticated ? (
          <NavigationMenu.Root className={styles.userMenuRoot}>
            <NavigationMenu.List className={styles.userMenuList}>
              <NavigationMenu.Item className={styles.userMenuItem}>
                <NavigationMenu.Trigger className={`${styles.login} ${styles.userMenuTrigger}`}>
                  <PersonIcon />
                  {username}
                  <CaretDownIcon className={styles.caretDown} aria-hidden />
                </NavigationMenu.Trigger>
                <NavigationMenu.Content className={styles.userMenuContent}>
                  <NavigationMenu.Link asChild>
                    <Link className={styles.userMenuLink} to="/user" state={{ tab: "favorites" }}>
                      <HeartFilledIcon />
                      Favorites
                    </Link>
                  </NavigationMenu.Link>
                  <NavigationMenu.Link asChild>
                    <Link className={styles.userMenuLink} to="/user" state={{ tab: "recent" }}>
                      <EyeOpenIcon />
                      Recently Viewed
                    </Link>
                  </NavigationMenu.Link>
                  <button className={styles.userMenuButton} type="button" onClick={handleLogout}>
                    <ExitIcon />
                    Log Out
                  </button>
                </NavigationMenu.Content>
              </NavigationMenu.Item>
            </NavigationMenu.List>
          </NavigationMenu.Root>
        ) : (
          <Link className={styles.login} to="/login">
            <EnterIcon />
            Login
          </Link>
        )}
      </header>
      <Toast.Root className="toastRoot" open={toastOpen} onOpenChange={setToastOpen}>
        <Toast.Title className="toastTitle">Successfully Logged Out</Toast.Title>
        <Toast.Description className="toastDescription">You have been signed out.</Toast.Description>
      </Toast.Root>
    </div>
  );
}

export default Header;
