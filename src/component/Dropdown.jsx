import React from "react";

export default function Dropdown({values, selectedKey, props, panelProps, itemProps, onChange}) {
	const [status, setStatus] = React.useState({
    selectedKey: selectedKey  
  })

  return (
    <div className="drop-panel">
      {status.selectedKey}
      <div className="drop-icon">
        <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="2em" width="2em" ><path d="M128 192l128 128 128-128z"></path></svg>
      </div>
      <div className="menu-panel" {...panelProps}>
        {
          values && values.map((item, index) => {
            return <div key={index} className="item flex middle" {...itemProps} onClick={() => {setStatus({selectedKey: item.name}); onChange(item.key)}}>
              {
                item.img && <img src={item.img} style={{width: '25px', height: '25px', marginRight:'10px', borderRadius: '50%'}} />
              }
              {item.name}
            </div>    
          })
        }
      </div>
    </div>
  );
}
