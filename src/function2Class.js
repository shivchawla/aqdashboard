import { useLocation, useParams } from "react-router-dom";
export const withRouter = WrappedComponent => props => {
    const params = useParams();
    // etc... other react-router-dom v6 hooks
    const {pathname: url} = useLocation();
    console.log(url)
    
    return (
      <WrappedComponent
        {...props}
        params={params}
        url={url}
        // etc...
      />
    );
  };