import '../css/General/NotFound.scss'

const NotFound = ({ additionalMessage = "" }) => (
    <div className='not-found-page'>
        <div className='text-wrapper'>
            <h2><code>404 not found</code></h2>
            {additionalMessage && <p>{additionalMessage}</p>}
        </div>
    </div>
)


export default NotFound