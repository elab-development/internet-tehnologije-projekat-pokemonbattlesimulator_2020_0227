import cat from '../assets/loadingPageAssets/loading_8.webp'

const WelcomeAdmin = () => {
    return (
        <div className='welcome-admin'>
            <p>Welcome Admin! <br />Good to see you again.</p>
            <img src={cat} alt='' />
        </div>
    )
}

export default WelcomeAdmin