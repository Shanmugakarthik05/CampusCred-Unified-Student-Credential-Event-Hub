import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Search,
  MapPin,
  Calendar,
  User,
  Users,
  Building2,
  Filter
} from 'lucide-react';
import type { FacultyMember } from '../App';
import { SCOFT_DEPARTMENTS, NON_SCOFT_DEPARTMENTS } from '../App';

interface FacultySearchProps {
  faculty: FacultyMember[];
}

export function FacultySearch({ faculty }: FacultySearchProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter faculty based on search criteria
  const filteredFaculty = useMemo(() => {
    if (!searchTerm) return faculty;
    
    return faculty.filter(member => {
      const searchLower = searchTerm.toLowerCase();
      return (
        member.name.toLowerCase().includes(searchLower) ||
        member.department.toLowerCase().includes(searchLower) ||
        member.roomNumber.toLowerCase().includes(searchLower) ||
        member.weekOffDay.toLowerCase().includes(searchLower)
      );
    });
  }, [faculty, searchTerm]);

  // Separate faculty by department type and role
  const scoftFaculty = filteredFaculty.filter(member => 
    SCOFT_DEPARTMENTS.includes(member.department) && !member.isHOD
  );
  
  const scoftHODs = filteredFaculty.filter(member => 
    SCOFT_DEPARTMENTS.includes(member.department) && member.isHOD
  );
  
  const nonScoftFaculty = filteredFaculty.filter(member => 
    NON_SCOFT_DEPARTMENTS.includes(member.department) && !member.isHOD
  );
  
  const nonScoftHODs = filteredFaculty.filter(member => 
    NON_SCOFT_DEPARTMENTS.includes(member.department) && member.isHOD
  );

  const FacultyCard = ({ member }: { member: FacultyMember }) => (
    <Card className="hover:shadow-lg transition-shadow duration-300 border-2 hover:border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-3">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{member.name}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <Building2 className="h-3 w-3" />
                {member.department}
              </CardDescription>
            </div>
          </div>
          {member.isHOD && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
              HOD
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <div className="bg-blue-50 rounded-lg p-2 flex-shrink-0">
            <MapPin className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Room Number</div>
            <div className="text-blue-700">{member.roomNumber}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="bg-purple-50 rounded-lg p-2 flex-shrink-0">
            <Calendar className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Week Off</div>
            <div className="text-purple-700">{member.weekOffDay}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-3">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Faculty Directory
            </h1>
          </div>
          <p className="text-muted-foreground">
            Find faculty members, their room locations, and availability
          </p>
        </div>
        
        {/* Search Bar */}
        <Card className="border-2 border-blue-100 bg-white/80 backdrop-blur">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600" />
              <Input
                placeholder="Search by name, department, room number, or week off day..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-2 border-blue-200 focus:border-blue-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Faculty Tabs */}
        <Tabs defaultValue="scoft-faculty" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-white/80 backdrop-blur border-2 border-blue-100">
            <TabsTrigger value="scoft-faculty" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              SCOFT Faculty
              <Badge className="ml-2 bg-blue-100 text-blue-800">{scoftFaculty.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="scoft-hod" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              SCOFT HODs
              <Badge className="ml-2 bg-amber-100 text-amber-800">{scoftHODs.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="nonscoft-faculty" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              Non-SCOFT Faculty
              <Badge className="ml-2 bg-green-100 text-green-800">{nonScoftFaculty.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="nonscoft-hod" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              Non-SCOFT HODs
              <Badge className="ml-2 bg-orange-100 text-orange-800">{nonScoftHODs.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scoft-faculty" className="mt-6">
            <div className="mb-4">
              <h2 className="text-xl flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                SCOFT Faculty Members
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Faculty from Science & Technology departments
              </p>
            </div>
            {scoftFaculty.length === 0 ? (
              <Card className="p-12">
                <div className="text-center text-muted-foreground">
                  <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No faculty members found</p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scoftFaculty.map((member) => (
                  <FacultyCard key={member.id} member={member} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="scoft-hod" className="mt-6">
            <div className="mb-4">
              <h2 className="text-xl flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-600" />
                SCOFT Heads of Department
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Department heads from Science & Technology departments
              </p>
            </div>
            {scoftHODs.length === 0 ? (
              <Card className="p-12">
                <div className="text-center text-muted-foreground">
                  <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No HODs found</p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scoftHODs.map((member) => (
                  <FacultyCard key={member.id} member={member} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="nonscoft-faculty" className="mt-6">
            <div className="mb-4">
              <h2 className="text-xl flex items-center gap-2">
                <Building2 className="h-5 w-5 text-green-600" />
                Non-SCOFT Faculty Members
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Faculty from Engineering & other departments
              </p>
            </div>
            {nonScoftFaculty.length === 0 ? (
              <Card className="p-12">
                <div className="text-center text-muted-foreground">
                  <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No faculty members found</p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nonScoftFaculty.map((member) => (
                  <FacultyCard key={member.id} member={member} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="nonscoft-hod" className="mt-6">
            <div className="mb-4">
              <h2 className="text-xl flex items-center gap-2">
                <Building2 className="h-5 w-5 text-orange-600" />
                Non-SCOFT Heads of Department
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Department heads from Engineering & other departments
              </p>
            </div>
            {nonScoftHODs.length === 0 ? (
              <Card className="p-12">
                <div className="text-center text-muted-foreground">
                  <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No HODs found</p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nonScoftHODs.map((member) => (
                  <FacultyCard key={member.id} member={member} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
