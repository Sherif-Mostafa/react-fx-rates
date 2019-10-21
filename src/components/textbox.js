import React from "react"

const TextBox = props => (<input onChange={props.onChange}
    type={props.type} pattern={props.pattern} disabled={props.disabled} value={props.value} placeholder={props.placeholder} />);

export default TextBox;