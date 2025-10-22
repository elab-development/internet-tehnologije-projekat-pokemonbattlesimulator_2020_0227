import React, { useContext } from 'react'
import { UserContext } from '../../contexts/UserContextProvider';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import '../css/Admin/AdminLayout.scss';
import { ADMIN } from '../utils/roles';

const AdminLayout = () => {
    const { info } = useContext(UserContext);
    const navigate = useNavigate();

    if (info.role != ADMIN) {
        console.log("redirect to home");
        return <Navigate to='/' replace={true} />
    }

    return (
        <div className='admin-wrapper'>
            <div className='tab-switch'>
                <button className='button-full' onClick={() => navigate("/admin/create/pokemon")}>
                    Create Pokemon
                </button>
                <button className='button-full' onClick={() => navigate("/admin/create/move")}>
                    Create Moves
                </button>
                <button className='button-full' onClick={() => navigate("/admin/create/award")}>
                    Award User
                </button>
            </div>
            <div className='admin-content'>
                <Outlet />
            </div>
        </div>
    )
}

export default AdminLayout