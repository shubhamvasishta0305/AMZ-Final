import { useNavigate } from "react-router-dom";

const LoginPage = () => {

    const navigate = useNavigate();
    
    return (
        <div>
            <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50">
                <div className="bg-white rounded-2xl shadow-lg p-10 w-110 h-96">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center mb-5">
                            <div className="w-9 h-7 bg-orange-500 rounded" />
                            <div className="ml-2 text-orange-600 text-2xl font-bold">COMPARATOR</div>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 p-2">Welcome to Amazon Product Comparator</h2>
                        <div className="mt-4 flex items-center justify-center">
                            <p className="text-gray-600 mt-2">Please sign in to continue.</p>
                        </div>
                    </div>
                    <button className="w-full flex items-center justify-center bg-white border border-gray-300 
                    rounded-xl shadow-sm py-3 hover:shadow-md transition-shadow duration-200" onClick={() => navigate('/seller-list')}>
                        <img className="pr-5" src="/src/assets/Google_logo.png" alt="Logo"/>
                        <span className="text-gray-700 text-lg font-medium">Sign in with Google</span>
                    </button>
                    <p className="text-center text-blue-500 text-sm mt-5">Only Vaco Binary emails can login</p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;