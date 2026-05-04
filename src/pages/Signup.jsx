import { SignUp } from '@clerk/clerk-react';

export default function Signup() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 bg-bg py-12">
            <SignUp 
                appearance={{
                    elements: {
                        formButtonPrimary: 'bg-brand hover:bg-brand/90 text-sm font-bold',
                        card: 'shadow-sm border border-brand/10 rounded-3xl',
                        headerTitle: 'text-2xl font-bold text-gray-800',
                        headerSubtitle: 'text-gray-500',
                    }
                }}
                signInUrl="/login"
                forceRedirectUrl="/"
            />
        </div>
    );
}
