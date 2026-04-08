import "../../../Styles/UserStyles/UserLoader.css"
import loaderimg from "../../../assets/userImages/Logo/loader1.png"
const UserLoader = () => {
    return (
        <>
            <div className="flex h-[80vh]   w-full justify-center items-center">
                {/* <div className="userloader"> */}
                <img src={loaderimg} alt="Loading..." className="animate-spin [animation-duration:2s]" />
                {/* </div> */}
            </div>

        </>
    )
}

export default UserLoader