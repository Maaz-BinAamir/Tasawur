import './App.css'

function NavBar(){
    return(
      <>
        <nav className="NavBar">
        <div className="logo">MyLogo</div>
        <div className="searchBar">
          <input type="text" placeholder="Search..." />
          <button>Search</button>
        </div>
        <div ><button ><img src="" alt="Home" /></button>
        <button><img src="" alt="Chats" /></button></div>
        </nav>
      </>
    );
  }
  
  export default NavBar;