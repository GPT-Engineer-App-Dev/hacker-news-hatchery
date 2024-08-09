import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const ITEMS_PER_PAGE = 20;

const fetchStories = async ({ page, sortBy }) => {
  const response = await fetch(
    `https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=${ITEMS_PER_PAGE}&page=${page}&${sortBy}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch stories");
  }
  return response.json();
};

const StoryCard = ({ story }) => (
  <Card className="mb-4">
    <CardHeader>
      <CardTitle className="text-lg font-semibold">{story.title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex justify-between items-center mb-2">
        <div>
          <Badge variant="secondary" className="mr-2">
            {story.points} points
          </Badge>
          <Badge variant="outline">
            {story.num_comments} comments
          </Badge>
        </div>
        <p className="text-sm text-gray-500">by {story.author}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.open(story.url, "_blank")}
      >
        Read More <ExternalLink className="ml-2 h-4 w-4" />
      </Button>
    </CardContent>
  </Card>
);

const SkeletonCard = () => (
  <Card className="mb-4">
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-1/4 mb-2" />
      <Skeleton className="h-8 w-24" />
    </CardContent>
  </Card>
);

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState("search");

  const { data, isLoading, error } = useQuery({
    queryKey: ["stories", currentPage, sortBy],
    queryFn: () => fetchStories({ page: currentPage, sortBy }),
  });

  const filteredStories = data?.hits.filter((story) =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil((data?.nbHits || 0) / ITEMS_PER_PAGE);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Top Hacker News Stories</h1>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <Input
          type="text"
          placeholder="Search stories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="search">Relevance</SelectItem>
            <SelectItem value="search_by_date">Date</SelectItem>
            <SelectItem value="search&numericFilters=points%3E100">Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoading && (
        <div>
          {[...Array(5)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      )}
      {error && <p className="text-red-500">Error: {error.message}</p>}
      {filteredStories && (
        <div>
          {filteredStories.map((story) => (
            <StoryCard key={story.objectID} story={story} />
          ))}
        </div>
      )}
      {data && (
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <span>
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
          >
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;