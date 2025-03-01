export function GetInitial(name: string){
  const initials = name?.match(/(\b\S)?/g)?.join("")?.match(/(^\S|\S$)?/g)?.join("")?.toUpperCase()
  return initials;
}
