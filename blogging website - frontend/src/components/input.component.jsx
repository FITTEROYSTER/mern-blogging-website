const InputBox = ({ name, type, id, value, placeholder }) => {
  return (
    <div className="relative w-[100%] mb-4">
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={value}
        id={id}
        className=""
      />
    </div>
  );
};

export default InputBox;
