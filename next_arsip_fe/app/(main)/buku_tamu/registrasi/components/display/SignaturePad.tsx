'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from 'primereact/button';

interface SignaturePadProps {
    onChange: (base64Image: string | null) => void;
}

export default function SignaturePad({ onChange }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);

    // Initialize canvas sizing
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width || 400;
        canvas.height = 150;
        
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Redraw check to set clean background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { x, y } = getCoordinates(e, canvas);
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { x, y } = getCoordinates(e, canvas);
        ctx.lineTo(x, y);
        ctx.stroke();
        setIsEmpty(false);
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        saveSignature();
    };

    const getCoordinates = (
        e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
        canvas: HTMLCanvasElement
    ) => {
        const rect = canvas.getBoundingClientRect();
        let clientX = 0;
        let clientY = 0;

        if ('touches' in e) {
            if (e.touches.length> 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            }
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setIsEmpty(true);
        onChange(null);
    };

    const saveSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Convert canvas image to data URL
        const dataUrl = canvas.toDataURL('image/png');
        onChange(dataUrl);
    };

    // prevent page scroll when touching canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const preventDefault = (e: TouchEvent) => {
            if (e.target === canvas) {
                e.preventDefault();
            }
        };

        canvas.addEventListener('touchstart', preventDefault, { passive: false });
        canvas.addEventListener('touchmove', preventDefault, { passive: false });
        
        return () => {
            canvas.removeEventListener('touchstart', preventDefault);
            canvas.removeEventListener('touchmove', preventDefault);
        };
    }, []);

    return (
        <div className="flex flex-column gap-2 border-round-xl border-1 surface-border p-3" style={{ background: '#f8fafc' }}>
            <div className="flex justify-content-between align-items-center mb-1">
                <span className="font-semibold text-sm text-800">Tanda Tangan Tamu (Gambarkan di Canvas) <span className="text-red-500">*</span></span>
                <Button type="button"
                    label="Bersihkan"
                    icon="pi pi-trash"
                    className="p-button-text p-button-danger p-button-sm py-1 px-2 border-none"
                    onClick={clearCanvas} />
            </div>
            <div 
                className="border-1 border-300 border-round-lg overflow-hidden bg-white flex justify-content-center align-items-center" 
                style={{ height: '150px' }}>
                <canvas
                    ref={canvasRef}
                    className="w-full h-full cursor-crosshair"
                    style={{ touchAction: 'none', background: '#ffffff' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing} />
            </div>
        </div>
    );
}
