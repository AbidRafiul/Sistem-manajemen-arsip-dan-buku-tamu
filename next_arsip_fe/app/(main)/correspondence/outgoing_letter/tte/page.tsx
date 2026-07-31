'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Page = () => {
    const router = useRouter();

    useEffect(() => {
        router.replace("/correspondence/outgoing_letter/tte/pending");
    }, [router]);

    return null;
};

export default Page;
