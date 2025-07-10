import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

export const getClient = () => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: "https://api.producthunt.com/v2/api/graphql",
      headers: {
        Authorization: `Bearer ${process.env.PRODUCT_HUNT_API_KEY}`,
        "Content-Type": "application/json"
      }
    })
  });
};