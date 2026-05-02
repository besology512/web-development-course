export default function SkeletonCard() {
    return (
        <div className="animate-pulse"
             style={{
                 background: '#ffffff',
                 border: '1px solid rgba(201, 214, 228, 0.86)',
                 borderRadius: 24,
                 overflow: 'hidden',
                 width: '100%',
                 maxWidth: 410,
                 boxShadow: '0 18px 40px rgba(22, 34, 58, 0.08)'
             }}>
            <div style={{ padding: 12, paddingBottom: 0 }}>
                <div style={{ aspectRatio: '16 / 9', background: '#eff5f9', borderRadius: 18 }} />
            </div>
            <div style={{ padding: 16 }}>
                <div style={{ height: 16, width: '72%', background: '#eff5f9', borderRadius: 999, marginBottom: 10 }} />
                <div style={{ height: 12, width: '34%', background: '#eff5f9', borderRadius: 999, marginBottom: 16 }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} style={{ height: 54, background: '#eff5f9', borderRadius: 16 }} />
                    ))}
                </div>
            </div>
        </div>
    );
}
