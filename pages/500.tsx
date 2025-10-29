export default function ServerError() {
  return (
    <div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      <div style={{maxWidth:480,textAlign:'center'}}>
        <h1 style={{fontSize:24,marginBottom:8}}>500 - Something went wrong</h1>
        <p style={{color:'#666'}}>Please try again later.</p>
      </div>
    </div>
  )
}


